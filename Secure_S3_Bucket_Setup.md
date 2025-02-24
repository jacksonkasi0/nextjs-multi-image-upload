# Secure S3 Bucket Setup Guide

This guide explains how to securely create an S3 bucket for storing and serving images. It walks you through each step—from creating the bucket to configuring access policies and CORS settings—ensuring your content is only accessible from trusted domains.

---

## 1. Create the S3 Bucket

1. **Log in to the AWS Management Console:**  
   Navigate to the S3 service.

2. **Create a New Bucket:**  
   - Click **Create bucket**.
   - Enter a unique bucket name (e.g., `best-practices-s3`) and select your desired AWS Region.
   - In the **Block Public Access settings**, enable **Block all public access** to prevent accidental exposure.

3. **Important Note:**  
   If you plan to add a bucket policy that grants limited public access (using conditions like the `aws:Referer`), you must disable the setting that blocks public bucket policies. Otherwise, you will encounter an error similar to:
   > "User: arn:aws:iam::... is not authorized to perform: s3:PutBucketPolicy ... because public policies are blocked by the BlockPublicPolicy block public access setting."  
   To allow your custom bucket policy, disable **Block public bucket policies** while keeping other block settings enabled.  
   *(Remember to carefully manage your policy to avoid unintentional exposure.)*

4. **Finalize Creation:**  
   Complete the remaining steps and click **Create bucket**.

---

## 2. Configure Object Ownership

1. **Set Object Ownership:**  
   - Go to your bucket’s **Permissions** tab.
   - Under **Object Ownership**, choose **Bucket owner enforced**.  
     This disables Access Control Lists (ACLs) so that only your bucket policy controls access.

---

## 3. Set Up a Bucket Policy

A bucket policy controls who can access your bucket’s objects. In this guide, we restrict image access so that it is only allowed from trusted domains (e.g., `*.gitpod.io` and `*.w3schools.com`).

1. **Open the Bucket Policy Editor:**  
   In the **Permissions** tab, click **Bucket Policy**.

2. **Paste the Following Policy:**  
   Replace `best-practices-s3` with your bucket name if necessary.

   ```json
   {
       "Version": "2012-10-17",
       "Id": "PolicyForTrustedAccess",
       "Statement": [
           {
               "Sid": "AllowTrustedAccess",
               "Effect": "Allow",
               "Principal": "*",
               "Action": "s3:GetObject",
               "Resource": "arn:aws:s3:::best-practices-s3/*",
               "Condition": {
                   "StringLike": {
                       "aws:Referer": [
                           "https://*.gitpod.io/*",
                           "https://*.w3schools.com/*"
                       ]
                   },
                   "Bool": {
                       "aws:SecureTransport": "true"
                   }
               }
           },
           {
               "Sid": "DenyNonTrustedAccess",
               "Effect": "Deny",
               "Principal": "*",
               "Action": "s3:GetObject",
               "Resource": "arn:aws:s3:::best-practices-s3/*",
               "Condition": {
                   "StringNotLike": {
                       "aws:Referer": [
                           "https://*.gitpod.io/*",
                           "https://*.w3schools.com/*"
                       ]
                   }
               }
           }
       ]
   }
   ```

3. **Save the Policy.**

---

## 4. Configure CORS (Cross-Origin Resource Sharing)

CORS settings allow your images to be requested by web pages from specific domains and enable uploads using signed URLs if needed.

1. **Open the CORS Configuration Editor:**  
   In the **Permissions** tab, click **CORS configuration**.

2. **Enter the Following Configuration:**

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET"],
        "AllowedOrigins": [
            "https://*.gitpod.io",
            "https://*.w3schools.com"
        ],
        "ExposeHeaders": []
    }
]
```

### 🟢 **Important Note:**  
If you need to **upload images** using **signed URLs**, you must allow the **PUT** method in the CORS configuration to avoid CORS errors. The configuration would look like this:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT"],
        "AllowedOrigins": [
            "https://*.gitpod.io",
            "https://*.w3schools.com"
        ],
        "ExposeHeaders": []
    }
]
```

3. **Save the CORS Configuration.**

![S3 Example](/public/s3-example.png)

---

## 5. Enable Additional Security Features

### Encryption
- **Enable Server-Side Encryption:**  
  In your bucket properties, enable SSE-S3 or SSE-KMS to secure data at rest.

### Logging and Monitoring
- **Enable Access Logging:**  
  Turn on S3 server access logging to monitor requests.
- **Use AWS CloudTrail:**  
  Set up CloudTrail to log API calls for auditing purposes.

---

## 6. Test Your Configuration

1. **Upload an Image:**  
   Use the AWS Console, CLI, or SDK to upload an image to your bucket.

2. **Access from Allowed Domains:**  
   Place an `<img>` tag on a web page hosted on an allowed domain (e.g., Gitpod or W3Schools):

   ```html
   <img src="https://best-practices-s3.s3.ap-south-1.amazonaws.com/uploads/images/your-image.png" alt="Test Image" width="500" height="600">
   ```

3. **Verify Access:**  
   - The image should load when accessed from trusted domains.
   - Requests from other sources should return a **403 Forbidden** error.

---

## 7. Best Practices Recap

- **Block Public Access:**  
  Enable Block all public access settings to prevent accidental exposure. If you add a bucket policy that grants limited public access, disable only the **Block public bucket policies** setting.
- **Least Privilege:**  
  Grant only the permissions needed to trusted users or domains.
- **Use HTTPS:**  
  Enforce HTTPS by including `"aws:SecureTransport": "true"` in your bucket policy.
- **Monitor Activity:**  
  Regularly review logs from S3 and CloudTrail to ensure your bucket remains secure.

---


## **Frequently Asked Questions (FAQ) - Secure S3 Bucket Setup**

---

### **1. Why do I need to disable 'Block public bucket policies'?**
When you apply a bucket policy that uses conditions like `aws:Referer` to control access, AWS considers it a "public policy." If **Block public bucket policies** is enabled, AWS will prevent you from saving this policy, showing an error:
> "User is not authorized to perform: s3:PutBucketPolicy ... because public policies are blocked by the BlockPublicPolicy block public access setting."

To resolve this, disable **Block public bucket policies** while keeping other public access blocks enabled to maintain security.

---

### **2. Can I allow access to specific domains without using 'aws:Referer'?**
Yes, but it requires a more advanced setup using **AWS CloudFront** with **signed URLs** or **Origin Access Control (OAC)**. This approach is more secure because the `Referer` header can be spoofed. Using CloudFront also allows you to apply additional security measures such as WAF (Web Application Firewall) rules.

---

### **3. What should I do if I get a 403 Forbidden error while accessing my S3 object?**
A **403 Forbidden** error typically indicates a permissions issue. Check the following:
- Make sure the **aws:Referer** condition in the bucket policy exactly matches the request domain.
- Verify that the **CORS configuration** allows the method (**GET** or **PUT**) you are using.
- Ensure that **HTTPS** is used for requests if **aws:SecureTransport: true** is set in your policy.

---

### **4. How do I avoid CORS errors when uploading with signed URLs?**
If you're using signed URLs to upload files via **PUT** requests:
- Update the CORS configuration to include **PUT** in the **AllowedMethods**.
```json
"AllowedMethods": ["GET", "PUT"]
```
- Make sure the **AllowedOrigins** includes your domain (e.g., `https://*.gitpod.io`).

---

### **5. Is it safe to set 'AllowedHeaders' to '*' in the CORS configuration?**
Setting `"AllowedHeaders": ["*"]` is generally safe for S3 if you are confident about the trusted domains specified in **AllowedOrigins**. This setting allows any header to be sent in the request, which is useful when working with signed URLs or passing custom headers. However, avoid this in high-security environments unless necessary.

---

### **6. Should I enable server-side encryption (SSE) for my S3 bucket?**
Yes, enabling **Server-Side Encryption (SSE)** is recommended to secure data at rest. You can choose between:
- **SSE-S3:** AWS manages the encryption keys.
- **SSE-KMS:** Provides more control over encryption keys through AWS Key Management Service (KMS).

---

### **7. How do I monitor access to my S3 bucket?**
- Enable **S3 Server Access Logging** to track requests made to your bucket.
- Set up **AWS CloudTrail** to log all API calls, providing an audit trail of actions performed on your S3 bucket.

---

### **8. What is the difference between 'Bucket Owner Enforced' and 'Bucket Owner Preferred' in Object Ownership?**
- **Bucket Owner Enforced:** Disables **ACLs** (Access Control Lists) entirely, ensuring all access is managed through bucket policies. Recommended for most use cases as it simplifies permissions and enhances security.
- **Bucket Owner Preferred:** Allows **ACLs** but gives the bucket owner control over new objects uploaded with the **bucket-owner-full-control** canned ACL.

---

### **9. Can I allow access to my bucket for a specific application but block others?**
Yes, you can:
- Use the **aws:Referer** condition in the bucket policy to allow only specific domains.
- Alternatively, use **signed URLs** or **signed cookies** with **AWS CloudFront** for tighter control over access.

---

### **10. What are the best practices for securing an S3 bucket?**
- **Block Public Access:** Keep public access blocked unless a specific use case requires it.
- **Apply the Least Privilege Principle:** Grant only the permissions needed.
- **Enforce HTTPS:** Use `"aws:SecureTransport": "true"` in your bucket policy.
- **Enable Encryption:** Use **SSE-S3** or **SSE-KMS** for data at rest.
- **Monitor Activity:** Use **S3 Server Access Logs** and **AWS CloudTrail** for visibility and auditing.

---

By following this guide, you'll create an S3 bucket that securely stores and serves images while ensuring access is granted only to trusted domains. For further details, consult the [AWS S3 Documentation](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html).

Happy securing!

export const certificateTemplate = (userName: string, courseTitle: string, issuedDate: string, certificateId: string) => {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Course Completion Certificate</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .certificate {
            width: 800px;
            max-width: 90%;
            background: white;
            border-radius: 15px;
            padding: 40px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            position: relative;
            text-align: center;
        }
        .certificate-header {
            border-bottom: 3px solid #e5e7eb;
            padding-bottom: 20px;
            margin-bottom: 20px;
        }
        .certificate-title {
            font-size: 36px;
            font-weight: bold;
            color: #2d3748;
            margin-bottom: 10px;
        }
        .certificate-content {
            margin: 20px 0;
        }
        .certificate-name {
            font-size: 24px;
            font-weight: bold;
            color: #1a202c;
            margin-bottom: 15px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 8px;
        }
        .certificate-course {
            font-size: 18px;
            color: #374151;
            margin-bottom: 10px;
            font-style: italic;
        }
        .certificate-date {
            font-size: 14px;
            color: #6b7280;
            margin-top: 20px;
        }
        .certificate-footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            font-size: 12px;
            color: #6b7280;
        }
        .seal {
            position: absolute;
            bottom: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            background: #ffd700;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            color: #333;
            font-size: 10px;
        }
    </style>
</head>
<body>
    <div class="certificate">
        <div class="certificate-header">
            <div class="certificate-title">Certificate of Completion</div>
        </div>
        <div class="certificate-content">
            <div class="certificate-name">${userName}</div>
            <div class="certificate-course">has successfully completed the course</div>
            <div class="certificate-course">"${courseTitle}"</div>
            <div class="certificate-date">Completed on ${issuedDate}</div>
        </div>
        <div class="certificate-footer">
            Certificate ID: ${certificateId}
            <div class="seal">VERIFIED</div>
        </div>
    </div>
</body>
</html>
  `;
};

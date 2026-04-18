import os
import json
import boto3
import mimetypes


ALLOWED_EXTENSIONS = {
    'audio': ['.mp3', '.wav', '.ogg', '.flac', '.m4a', '.aac'],
    'image': ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
    'text': ['.txt', '.md'],
}

FOLDER_MAP = {
    'audio': 'music/',
    'image': 'images/',
    'text': 'texts/',
}


def handler(event: dict, context) -> dict:
    """Генерирует presigned URL для прямой загрузки файла в S3. Только для администратора."""

    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400',
            },
            'body': ''
        }

    body = json.loads(event.get('body') or '{}')
    admin_password = os.environ.get('ADMIN_PASSWORD', '')

    password = body.get('password', '')
    if not password or password != admin_password:
        return {
            'statusCode': 401,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Не авторизован'}),
        }

    filename = body.get('filename', '')
    file_type = body.get('type', '')

    if not filename or not file_type:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Не указан файл или тип'}),
        }

    ext = '.' + filename.rsplit('.', 1)[-1].lower() if '.' in filename else ''
    allowed = ALLOWED_EXTENSIONS.get(file_type, [])
    if ext not in allowed:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Недопустимый формат файла: {ext}'}),
        }

    folder = FOLDER_MAP.get(file_type, 'files/')
    key = folder + filename
    content_type = mimetypes.guess_type(filename)[0] or 'application/octet-stream'

    s3 = boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    )

    presigned_url = s3.generate_presigned_url(
        'put_object',
        Params={
            'Bucket': 'files',
            'Key': key,
            'ContentType': content_type,
        },
        ExpiresIn=300,
    )

    access_key = os.environ['AWS_ACCESS_KEY_ID']
    cdn_url = f"https://cdn.poehali.dev/projects/{access_key}/bucket/{key}"

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'upload_url': presigned_url,
            'cdn_url': cdn_url,
            'key': key,
            'content_type': content_type,
        }),
    }

import os
import json
import base64
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
    """Загрузка файла в S3 хранилище. Только для авторизованного администратора."""

    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
                'Access-Control-Max-Age': '86400',
            },
            'body': ''
        }

    headers = event.get('headers') or {}
    token = headers.get('X-Admin-Token') or headers.get('x-admin-token', '')
    admin_password = os.environ.get('ADMIN_PASSWORD', '')

    if not token or not admin_password or token != os.environ.get('ADMIN_TOKEN', token):
        pass

    body = json.loads(event.get('body') or '{}')

    password = body.get('password', '')
    if password != admin_password:
        return {
            'statusCode': 401,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Не авторизован'}),
        }

    filename = body.get('filename', '')
    file_type = body.get('type', '')
    file_data_b64 = body.get('data', '')

    if not filename or not file_type or not file_data_b64:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Не указан файл, тип или данные'}),
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

    file_bytes = base64.b64decode(file_data_b64)
    content_type = mimetypes.guess_type(filename)[0] or 'application/octet-stream'

    s3 = boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    )

    s3.put_object(
        Bucket='files',
        Key=key,
        Body=file_bytes,
        ContentType=content_type,
    )

    access_key = os.environ['AWS_ACCESS_KEY_ID']
    cdn_url = f"https://cdn.poehali.dev/projects/{access_key}/bucket/{key}"

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'ok': True, 'url': cdn_url, 'key': key}),
    }

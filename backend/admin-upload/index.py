import os
import json
import base64
import boto3
import mimetypes
from urllib.parse import unquote


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
    """Загрузка файла в S3. Файл передаётся бинарно в теле запроса, метаданные — в заголовках."""

    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Password, X-Filename, X-File-Type',
                'Access-Control-Max-Age': '86400',
            },
            'body': ''
        }

    headers = {k.lower(): v for k, v in (event.get('headers') or {}).items()}
    admin_password = os.environ.get('ADMIN_PASSWORD', '')

    password = headers.get('x-password', '')
    if not password or password != admin_password:
        return {
            'statusCode': 401,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Не авторизован'}),
        }

    filename = unquote(headers.get('x-filename', ''))
    file_type = headers.get('x-file-type', '')

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
            'body': json.dumps({'error': f'Недопустимый формат: {ext}'}),
        }

    folder = FOLDER_MAP.get(file_type, 'files/')
    key = folder + filename
    content_type = mimetypes.guess_type(filename)[0] or 'application/octet-stream'

    raw_body = event.get('body') or ''
    if event.get('isBase64Encoded'):
        file_bytes = base64.b64decode(raw_body)
    else:
        file_bytes = raw_body.encode('utf-8') if isinstance(raw_body, str) else raw_body

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
import os
import json
import boto3


FOLDERS = ['music/', 'images/', 'texts/']
TYPE_MAP = {'music/': 'audio', 'images/': 'image', 'texts/': 'text'}


def handler(event: dict, context) -> dict:
    """Возвращает список всех загруженных файлов в S3 для администратора."""

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
    password = body.get('password', '')
    admin_password = os.environ.get('ADMIN_PASSWORD', '')

    if not password or password != admin_password:
        return {
            'statusCode': 401,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Не авторизован'}),
        }

    s3 = boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    )

    access_key = os.environ['AWS_ACCESS_KEY_ID']
    files = []

    for folder in FOLDERS:
        resp = s3.list_objects_v2(Bucket='files', Prefix=folder)
        for obj in resp.get('Contents', []):
            key = obj['Key']
            filename = key.replace(folder, '', 1)
            if not filename:
                continue
            url = f"https://cdn.poehali.dev/projects/{access_key}/bucket/{key}"
            files.append({
                'key': key,
                'filename': filename,
                'type': TYPE_MAP.get(folder, 'file'),
                'size': obj['Size'],
                'url': url,
            })

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'files': files}),
    }

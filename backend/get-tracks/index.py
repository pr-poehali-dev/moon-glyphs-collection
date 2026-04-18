import os
import boto3
import json


def handler(event: dict, context) -> dict:
    """Возвращает список аудио-треков из S3 хранилища с публичными CDN-ссылками."""

    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400',
            },
            'body': ''
        }

    s3 = boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    )

    access_key = os.environ['AWS_ACCESS_KEY_ID']
    prefix = 'music/'

    response = s3.list_objects_v2(Bucket='files', Prefix=prefix)
    contents = response.get('Contents', [])

    tracks = []
    audio_extensions = ('.mp3', '.wav', '.ogg', '.flac', '.m4a', '.aac')

    for obj in contents:
        key = obj['Key']
        if key.lower().endswith(audio_extensions):
            filename = key.replace(prefix, '', 1)
            name = filename.rsplit('.', 1)[0].replace('_', ' ').replace('-', ' ')
            url = f"https://cdn.poehali.dev/projects/{access_key}/bucket/{key}"
            tracks.append({
                'key': key,
                'name': name,
                'url': url,
                'size': obj['Size'],
            })

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'tracks': tracks}),
    }

import os
import json
import hashlib
import secrets


def handler(event: dict, context) -> dict:
    """Авторизация администратора по паролю. Возвращает токен сессии."""

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

    if not admin_password or password != admin_password:
        return {
            'statusCode': 401,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Неверный пароль'}),
        }

    token = hashlib.sha256(f"{admin_password}{secrets.token_hex(16)}".encode()).hexdigest()

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'token': token, 'ok': True}),
    }

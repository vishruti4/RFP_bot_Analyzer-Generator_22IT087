const CLIENT_ID = import.meta.env.VITE_COGNITO_CLIENT_ID as string
const CLIENT_SECRET = import.meta.env.VITE_COGNITO_CLIENT_SECRET as string
const REGION = (import.meta.env.VITE_COGNITO_USER_POOL_ID as string).split('_')[0]
const ENDPOINT = `https://cognito-idp.${REGION}.amazonaws.com/`

async function secretHash(username: string): Promise<string> {
    const enc = new TextEncoder()
    const key = await crypto.subtle.importKey(
        'raw', enc.encode(CLIENT_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    )
    const sig = await crypto.subtle.sign('HMAC', key, enc.encode(username + CLIENT_ID))
    return btoa(String.fromCharCode(...new Uint8Array(sig)))
}

async function cognitoRequest(target: string, body: object) {
    const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-amz-json-1.1',
            'X-Amz-Target': target,
        },
        body: JSON.stringify(body),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || data.__type || 'Cognito error')
    return data
}

export async function cognitoSignIn(email: string, password: string) {
    return cognitoRequest('AWSCognitoIdentityProviderService.InitiateAuth', {
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: CLIENT_ID,
        AuthParameters: {
            USERNAME: email,
            PASSWORD: password,
            SECRET_HASH: await secretHash(email),
        },
    })
}

export async function cognitoSignUp(name: string, email: string, password: string) {
    return cognitoRequest('AWSCognitoIdentityProviderService.SignUp', {
        ClientId: CLIENT_ID,
        SecretHash: await secretHash(email),
        Username: email,
        Password: password,
        UserAttributes: [
            { Name: 'email', Value: email },
            { Name: 'name', Value: name },
        ],
    })
}

export async function cognitoConfirm(email: string, code: string) {
    return cognitoRequest('AWSCognitoIdentityProviderService.ConfirmSignUp', {
        ClientId: CLIENT_ID,
        SecretHash: await secretHash(email),
        Username: email,
        ConfirmationCode: code,
    })
}

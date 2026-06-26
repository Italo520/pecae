import requests

url = 'https://painel.italohub.cloud/api/v1/applications'
headers = {'Authorization': 'Bearer 2|LVoaYR8TeP9EM15e5C0NGpkyaAllxPbqrqxum9Zs27fce58d'}

response = requests.get(url, headers=headers)
print('Status Code:', response.status_code)
if response.status_code == 200:
    apps = response.json()
    for app in apps:
        print(f"App: {app.get('name')}, UUID: {app.get('uuid')}")
else:
    print('Error:', response.text)

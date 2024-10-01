import os
import requests
import re

# Configuración de la API de YouTube
API_KEY = os.getenv('YOUTUBE_API_KEY')
CHANNEL_ID = (
    'UCn5vGoRR4isNbSnL0GcNcAg'  # ID del canal de YouTube de DevTool School
)


def get_latest_videos():
    if not API_KEY:
        raise ValueError(
            'ERROR: La clave de la API de YouTube no está configurada.'
        )

    youtube_api_url = f'https://www.googleapis.com/youtube/v3/search?key={API_KEY}&channelId={CHANNEL_ID}&part=snippet&order=date&maxResults=6&type=video'

    response = requests.get(youtube_api_url)
    response.raise_for_status()  # Levanta un error si la solicitud falla

    videos = [
        {
            'title': item['snippet']['title'],
            'url': f'https://www.youtube.com/watch?v={item["id"]["videoId"]}',
            'thumbnail': item['snippet']['thumbnails']['medium']['url'],
        }
        for item in response.json().get('items', [])
    ]

    return videos


def generate_youtube_cards(videos):
    youtube_cards = ""
    for video in videos:
        youtube_cards += (
            f"[![{video['title']}]({video['thumbnail']})]({video['url']})\n\n"
        )
    return youtube_cards


def update_readme(youtube_cards):
    with open('README.md', 'r') as file:
        readme_content = file.read()

    updated_content = re.sub(
        r'<!-- BEGIN YOUTUBE-CARDS -->.*<!-- END YOUTUBE-CARDS -->',
        f'<!-- BEGIN YOUTUBE-CARDS -->\n{youtube_cards}<!-- END YOUTUBE-CARDS -->',
        readme_content,
        flags=re.DOTALL,
    )

    with open('README.md', 'w') as file:
        file.write(updated_content)

    print('README.md actualizado con éxito.')


def main():
    try:
        videos = get_latest_videos()
        if videos:
            youtube_cards = generate_youtube_cards(videos)
            update_readme(youtube_cards)
        else:
            print('No se pudieron obtener videos del canal de YouTube.')
    except Exception as e:
        print(f'Ocurrió un error: {e}')


if __name__ == '__main__':
    main()

import requests
from bs4 import BeautifulSoup
import datetime

# List of blog URLs to scrape
blog_urls = [
    'https://engineering.fb.com/2024/03/18/data-infrastructure/logarithm-logging-engine-ai-training-workflows-services-meta/',
    'https://www.databricks.com/blog/introducing-dbrx-new-state-art-open-llm',
    'https://discord.com/blog/our-quest-to-support-game-developers'
]

# Function to scrape blog details from a given URL
def scrape_blog_details(url):
    response = requests.get(url)
    soup = BeautifulSoup(response.content, 'html.parser')

    # Extract title, hero image, and description (you might need to adjust the selectors based on the site's structure)
    title = soup.find('h1').get_text()
    hero_image = soup.find('img')['src']
    description = soup.find('meta', {'name': 'description'})['content']

    return {
        'title': title,
        'hero_image': hero_image,
        'description': description,
        'link': url
    }

# Main function to generate the weekly review Markdown file
def generate_weekly_review():
    all_blogs = [scrape_blog_details(url) for url in blog_urls]

    # Generate Markdown content with blog cards
    markdown_content = '# Weekly Review\n\n'
    for blog in all_blogs:
        markdown_content += f"![{blog['title']}]({blog['hero_image']})\n"
        markdown_content += f"### [{blog['title']}]({blog['link']})\n"
        markdown_content += f"{blog['description']}\n\n"

    # Write to a Markdown file with the current date as the filename
    filename = f'weekly_review_{datetime.date.today()}.md'
    with open(filename, 'w') as file:
        file.write(markdown_content)

    print(f'Weekly review file generated: {filename}')

#if __name__ == '__main__':
    #generate_weekly_review()

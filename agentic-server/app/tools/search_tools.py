from langchain_tavily import TavilySearch
from langchain_community.tools import WikipediaQueryRun, YouTubeSearchTool
from langchain_community.tools import JinaSearch
from langchain_community.tools.pubmed.tool import PubmedQueryRun,PubMedAPIWrapper
from langchain_community.utilities import WikipediaAPIWrapper
from langchain_community.utilities.pubmed import PubMedAPIWrapper
import os
from langchain_community.utilities import GoogleSerperAPIWrapper
from langchain_core.tools import Tool

from ..config import TAVILY_API_KEY, SERPER_API_KEY , JINA_API_KEY,PUBMED_API_KEY


# 1. Tavily Search
tavily_tool = TavilySearch(max_results=5, api_key=TAVILY_API_KEY)
tavily_tool.name = "tavily_search"
tavily_tool.description = "A powerful search engine for getting rich, structured answers and links. Use this for general, up-to-date information."

# 2. Jina Search (for reading URLs)
jina_tool = JinaSearch(api_key=JINA_API_KEY)
jina_tool.name = "jina_search"
jina_tool.description = "A tool for semantic search and retrieving full-page content from URLs. Use this when you need to read the content of a specific webpage."

# 3. YouTube Search
youtube_tool = YouTubeSearchTool()
youtube_tool.name = "youtube_search"
youtube_tool.description = "A tool for finding videos on meditation, relaxation, and psychoeducation on YouTube. Useful for finding visual or audio guides."

# 4. Google Serper (as a general search tool)
serper_api_wrapper = GoogleSerperAPIWrapper(serper_api_key=SERPER_API_KEY)
serper_search_tool = Tool(
    name="google_search_wellness",
    func=serper_api_wrapper.run,
    description="A real-time search engine for reliable general wellness resources, articles, and coping strategies.",
)

# 5. Wikipedia
wikipedia_api_wrapper = WikipediaAPIWrapper()
wikipedia_tool = Tool(
    name="wikipedia_search",
    func=wikipedia_api_wrapper.run,
    description="A tool for getting general, simplified explanations on psychological concepts, conditions, or terminology from Wikipedia."
)

\
pubmed_api_wrapper = PubMedAPIWrapper(api_key=PUBMED_API_KEY, email="ashutoshsidhya69@gmail.com")
pubmed_tool = Tool(
    name="pubmed_search",
    func=pubmed_api_wrapper.run,
    description="A tool for searching clinical and psychological studies, papers, and research on PubMed. Use this for evidence-based and academic information."
)

# --- Final List of All Tools ---
all_tools = [
    tavily_tool,
    jina_tool,
    youtube_tool,
    serper_search_tool,
    wikipedia_tool,
    pubmed_tool,
]
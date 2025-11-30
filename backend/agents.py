import os
import datetime
from openai import OpenAI
from dotenv import load_dotenv
from duckduckgo_search import DDGS

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    print("Warning: GEMINI_API_KEY not found in environment variables.")

client = OpenAI(
    api_key=GEMINI_API_KEY,
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
)

# Configuration
MODEL_NAME = "gemini-2.5-flash"

class ResearchAgent:
    """
    Responsible for fetching real-time data, current context, and factual proof.
    """
    def get_current_context(self) -> str:
        """Returns the current date and day."""
        now = datetime.datetime.now()
        return f"Current Date: {now.strftime('%A, %B %d, %Y')}"

    def search_web(self, query: str, max_results: int = 3) -> str:
        """Searches the web for facts using DuckDuckGo."""
        try:
            results = DDGS().text(query, max_results=max_results)
            if not results:
                return "No specific search results found."
            
            # Format results into a readable string
            fact_sheet = ""
            for i, res in enumerate(results, 1):
                fact_sheet += f"{i}. {res['title']}: {res['body']} (Source: {res['href']})\n"
            return fact_sheet
        except Exception as e:
            # Fallback if search fails (e.g. rate limits)
            return f"Search unavailable: {str(e)}"

class SocialMediaAgent:
    def __init__(self):
        self.researcher = ResearchAgent()
        self.system_role = "You are a world-class Social Media Strategist. You write content that is witty, viral, and factually accurate."

    def _call_llm(self, prompt: str) -> str:
        try:
            response = client.chat.completions.create(
                model=MODEL_NAME,
                messages=[
                    {"role": "system", "content": self.system_role},
                    {"role": "user", "content": prompt}
                ]
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            return f"Error generating content: {e}"

    def generate_ideas(self, niche: str, count: int) -> str:
        """Generates viral content ideas."""
        prompt = f"""
        Generate {count} unique, high-engagement social media content ideas for the '{niche}' niche.
        Format the output as a clean numbered list. 
        For each idea, briefly explain *why* it would work (the psychological hook).
        """
        return self._call_llm(prompt)

    def generate_plan_with_trends(self, niche: str, platforms: list, duration: str) -> str:
        """Generates a plan that considers the current date/season."""
        date_context = self.researcher.get_current_context()
        platform_str = ", ".join(platforms)
        
        prompt = f"""
        Create a {duration} social media content plan for the '{niche}' niche.
        Target Platforms: {platform_str}
        Context: {date_context}
        
        Provide:
        1. High-Level Strategy (Theme based on current date/season).
        2. Execution Plan (Day-by-Day) with specific content formats and hooks.
        """
        return self._call_llm(prompt)

    def create_fact_based_post(self, topic: str, platform: str, tone: str) -> str:
        """
        1. Researches the topic.
        2. Drafts with facts.
        3. Refines internally.
        4. Returns ONLY the final result.
        """
        # --- PHASE 1: RESEARCH ---
        date_context = self.researcher.get_current_context()
        search_results = self.researcher.search_web(topic)
        
        research_context = f"""
        {date_context}
        Latest Web Facts on '{topic}':
        {search_results}
        """

        # --- PHASE 2: DRAFTING (With Facts) ---
        draft_prompt = f"""
        Write a social media post for {platform} about '{topic}'.
        Tone: {tone}
        
        Use the following REAL-TIME DATA to make the post accurate and timely:
        {research_context}
        
        Structure:
        1. Hook (catchy, uses a fact if relevant)
        2. Body (Engaging, uses the researched info)
        3. Call to Action
        4. Hashtags
        """
        draft = self._call_llm(draft_prompt)

        # --- PHASE 3: REFINEMENT ---
        refine_prompt = f"""
        Act as a senior editor. Polish this draft to make it go viral.
        
        Draft:
        {draft}
        
        Instructions:
        - Ensure facts from the context ({date_context}) are used naturally.
        - Make the hook 'scroll-stopping'.
        - Remove robotic phrasing.
        - Return ONLY the final polished post text.
        """
        return self._call_llm(refine_prompt)
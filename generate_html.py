import markdown

for doc in ["AQUILA_OS_Business_Model.md", "AQUILA_OS_Research_Paper.md"]:
    with open(f"Judge_Documents/{doc}", "r") as f:
        md_text = f.read()
    
    html = markdown.markdown(md_text, extensions=['tables'])
    
    full_html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 40px; color: #333; }}
            h1, h2, h3 {{ color: #111; }}
            h1 {{ border-bottom: 2px solid #eee; padding-bottom: 10px; }}
            table {{ border-collapse: collapse; width: 100%; margin: 20px 0; }}
            th, td {{ border: 1px solid #ddd; padding: 12px; text-align: left; }}
            th {{ background-color: #f8f9fa; font-weight: 600; }}
            hr {{ border: 0; border-top: 1px solid #eee; margin: 30px 0; }}
        </style>
    </head>
    <body>
        {html}
    </body>
    </html>
    """
    
    html_name = doc.replace(".md", ".html")
    with open(f"Judge_Documents/{html_name}", "w") as f:
        f.write(full_html)

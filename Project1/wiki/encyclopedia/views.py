import random

from django.shortcuts import render, redirect

from . import util

from django.http import Http404

from markdown2 import Markdown
markdowner = Markdown()



def index(request):
    return render(request, "encyclopedia/index.html", {
        "entries": util.list_entries()
    })

def entry(request, entry_name):
    content = util.get_entry(entry_name)
    if content != None:
        return render(request, "encyclopedia/entry.html", {
            "body": markdowner.convert(content),
            "name": entry_name
        })
    raise Http404("Entry does not exist")

def search(request):
    query = request.POST["q"]
    content = util.get_entry(query)
    if content != None:
        return redirect('entry', entry_name=query)
    results = []
    related = {}
    for entry in util.list_entries():
        if entry.lower().find(query.lower()) >= 0:
            results.append(entry)
    for entry in util.list_entries():
        num = util.get_entry(entry).find(query)
        if num >= 0:
            related[entry] = "..."+ util.get_entry(entry)[0 if (num-20) < -1 else (num-20):len(util.get_entry(entry))-1 if (num+20) >= len(util.get_entry(entry)) else (num+20)]+ "..."
    return render(request, "encyclopedia/search.html", {
        "results": results,
        "related": related.items(),
        "query": query
    })

def newpage(request):
    entries = util.list_entries()
    if request.method == 'POST':
        title = request.POST["title"]
        content = request.POST["content"]
        if title in entries:
            content = content.replace('\r','')
            return render(request, "encyclopedia/newpage.html", {
                "title": title,
                "content": content
            })
        if title == None or content == None:
            raise Http404("Content or title is empty")
        else:
            util.save_entry(title, content)
        return redirect('index')
    return render(request, "encyclopedia/newpage.html")

def editpage(request, entry):
    content = util.get_entry(entry)
    content = content.replace('\r','')
    if content == None:
        raise Http404("Entry does not exist")
    if request.method == 'POST':
        content = request.POST["content"]
        if content == None:
            raise Http404("Content is empty")
        else:
            util.save_entry(entry, content)
        return redirect('entry', entry_name=entry)
    return render(request, "encyclopedia/editpage.html", {
        "entry": entry,
        "content": content
    })

def randompage(request):
    entries = util.list_entries()
    entry = random.choice(entries)
    return redirect('entry', entry_name=entry)

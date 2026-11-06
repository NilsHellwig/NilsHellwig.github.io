After my [predictions for 2027](/blog/predictions-2027), here's something more practical: how I currently use agents in my day-to-day work. None of this is spectacular on its own, but together it saves me a surprising amount of time every week.

## 1. Mail, issues and screenshots with a local LLM

A lot of my work starts in my inbox. I use a Thunderbird skill that reads my local mail (read-only, it can't send anything) and helps me get an overview of what's new or draft a reply. The important part: it runs with a **local LLM**. There's a lot in my mails that I don't want to leave my machine.

The same idea works for issues. Atlassian offers an official [MCP server](https://github.com/atlassian/atlassian-mcp-server) for Jira and Confluence, and it respects the permissions you already have. Connected to a local LLM, I can ask for open tickets, get a summary of a long discussion or update an issue without clicking through Jira myself.

And then there are screenshots. When I want to show a client the current state of a project, I don't take them by hand anymore. The agent opens the app with [Playwright](https://playwright.dev/docs/screenshots), clicks through the relevant pages and saves a screenshot of each one, on desktop and mobile if needed. That way the client sees what changed without me having to deploy a preview first, and I can do it after every larger change without thinking twice.

## 2. Checking papers with the ACL skill

For papers, I use my [ACL Paper Skills](/projects/acl-paper-skills), a Claude Code plugin I built for checking NLP papers written with the ACL template. Two things matter most to me: that I haven't overlooked a relevant paper, and that what I cite actually says what I claim it says.

For the first, the agent searches the ACL Anthology and arXiv for related work and adds what it finds to the project, as PDF, extracted text and reading notes. For the second, a paper only counts as citable once those notes record which parts of it were read and which claims it supports, with their location. So a citation never rests on the abstract alone. BibTeX entries are taken from the source itself and never written by the model, and a hook keeps the paper's `.bib` file in sync with the keys that are actually cited after every edit.

The plugin does a bit more than that:

- **Proofreading:** a skill reviews content, citations, language, consistency and machine-sounding prose, and writes every finding with a severity level into a `report.md`. I can then apply single items as minimal edits.
- **Guideline checks:** it checks the paper against the current ACL Rolling Review call for papers, the author checklist and the formatting rules (page limit, anonymity, Limitations section and so on).
- **Simulated reviews:** it writes reviews on the official ARR review form, so I see the weak spots before the actual reviewers do.
- **After the reviews:** skills for author responses and camera-ready preparation.

The guidelines change from cycle to cycle, so the plugin fetches the current ARR and ACLPUB documents from GitHub on every run instead of relying on a stored copy. It's built for checking a paper I wrote myself, not for generating one.

## 3. Building VST plugins

This one is more of a hobby, but it's where I was most surprised. Good audio plugins are expensive. FabFilter's Pro-Q 4, for example, costs around $179–249 depending on where you buy it, and that's a single EQ. If you need a few specific tools, it adds up quickly.

So I let an agent build the ones I need. Most plugins are written in C++ with [JUCE](https://juce.com/), which is well documented and has been around long enough that models know it well. I describe what the plugin should do and how the interface should look, and the agent writes the DSP code and the UI. The result is a plugin that does exactly what I want, not 80% of it plus thirty features I never use.

## 4. Everything in LaTeX

I've moved my slides from PowerPoint to LaTeX. The main reason is that agents work much better with plain text than with `.pptx` files. A Beamer presentation is just source code: the agent can read it, change it, and I can see every change as a diff in git.

Apple seems to have noticed the same problem. In October, they introduced the [Keynote Interchange Format](https://9to5mac.com/2026/10/22/pages-keynote-numbers-just-added-powerful-new-ai-features/) (`.keyx`), an open, JSON-based format that is meant to be readable by external tools and AI agents. Pages, Keynote and Numbers also got MCP support in the same update. So it's no longer just LaTeX people who think office documents should be easy for agents to work with 😉.

The real win is graphics. With TikZ, an agent can build diagrams that would take ages to click together in PowerPoint, for example a figure that builds up step by step over several slides. These are exactly the visuals that help students understand the content of my [lectures](/lectures) better, and I simply wouldn't have made most of them by hand.

I usually do this on the weekend, shortly before my Claude quota runs out 😅.

## 5. Spell checking with subagents

For spell checking, I run several subagents in parallel, each with an open-source LLM. Every subagent gets its own part of the text and has its [own context window](https://code.claude.com/docs/en/sub-agents), so it only has to focus on a few pages instead of the whole document. That works better than giving one model a long document at once, where it's easy to miss things towards the end.

Since the model is open source and runs locally, it doesn't cost me anything extra, and I can run it as often as I want, also on texts I wouldn't paste into a commercial chat.

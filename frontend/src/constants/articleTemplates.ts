// Article template definitions for quick start
export interface ArticleTemplate {
    id: string;
    name: string;
    description: string;
    category: string;
    content: string;
    icon: string;
}

export const articleTemplates: ArticleTemplate[] = [
    {
        id: 'tutorial',
        name: 'Tutorial Guide',
        description: 'Step-by-step instructional content with examples',
        category: 'Tutorial',
        icon: '📚',
        content: `<h2>Introduction</h2>
<p>Welcome to this tutorial! In this guide, you'll learn [topic].</p>

<h2>Prerequisites</h2>
<ul>
<li>Basic understanding of [concept]</li>
<li>Familiarity with [tool/technology]</li>
</ul>

<h2>Step 1: Getting Started</h2>
<p>First, we need to [action]. Here's how to do it:</p>

<h3>What You'll Learn</h3>
<ul>
<li>How to [skill 1]</li>
<li>Understanding [concept]</li>
<li>Best practices for [topic]</li>
</ul>

<h2>Step 2: Implementation</h2>
<p>Now let's implement the core functionality...</p>

<h2>Step 3: Testing</h2>
<p>It's important to verify that everything works correctly...</p>

<h2>Conclusion</h2>
<p>You've successfully learned [topic]. Next steps include...</p>`
    },
    {
        id: 'how-to',
        name: 'How-To Guide',
        description: 'Practical guide to accomplish a specific task',
        category: 'Guide',
        icon: '🛠️',
        content: `<h2>What You'll Accomplish</h2>
<p>By the end of this guide, you'll be able to [goal].</p>

<h2>What You Need</h2>
<ul>
<li>[Requirement 1]</li>
<li>[Requirement 2]</li>
<li>[Requirement 3]</li>
</ul>

<h2>Quick Overview</h2>
<p>This process involves [brief description of steps].</p>

<h2>Detailed Instructions</h2>

<h3>1. [First Major Step]</h3>
<p>[Detailed explanation]</p>

<h3>2. [Second Major Step]</h3>
<p>[Detailed explanation]</p>

<h3>3. [Third Major Step]</h3>
<p>[Detailed explanation]</p>

<h2>Troubleshooting</h2>
<p>If you encounter [common issue], try [solution].</p>

<h2>Tips for Success</h2>
<ul>
<li>[Tip 1]</li>
<li>[Tip 2]</li>
</ul>`
    },
    {
        id: 'case-study',
        name: 'Case Study',
        description: 'Analyze a real-world example or success story',
        category: 'Analysis',
        icon: '📊',
        content: `<h2>Executive Summary</h2>
<p>[Brief overview of the case study and key findings]</p>

<h2>Background</h2>
<p>[Context and background information]</p>

<h2>The Challenge</h2>
<p>[Description of the problem or situation]</p>

<h2>The Solution</h2>
<p>[Approach taken to address the challenge]</p>

<h3>Implementation</h3>
<p>[How the solution was implemented]</p>

<h2>Results</h2>
<ul>
<li>[Key metric 1]: [Result]</li>
<li>[Key metric 2]: [Result]</li>
<li>[Key metric 3]: [Result]</li>
</ul>

<h2>Key Takeaways</h2>
<ol>
<li>[Lesson learned 1]</li>
<li>[Lesson learned 2]</li>
<li>[Lesson learned 3]</li>
</ol>

<h2>Conclusion</h2>
<p>[Final thoughts and implications]</p>`
    },
    {
        id: 'review',
        name: 'Product Review',
        description: 'Comprehensive review of a product, tool, or service',
        category: 'Review',
        icon: '⭐',
        content: `<h2>Overview</h2>
<p>[Product/tool name] is [brief description]. In this review, we'll examine its features, performance, and value.</p>

<h2>Quick Verdict</h2>
<p><strong>Rating:</strong> [X]/10</p>
<p>[One-sentence summary of the verdict]</p>

<h2>What It Is</h2>
<p>[Detailed description of the product/tool]</p>

<h2>Key Features</h2>
<ul>
<li><strong>[Feature 1]:</strong> [Description]</li>
<li><strong>[Feature 2]:</strong> [Description]</li>
<li><strong>[Feature 3]:</strong> [Description]</li>
</ul>

<h2>Performance</h2>
<p>[How well does it work? Speed, reliability, etc.]</p>

<h2>Pros and Cons</h2>

<h3>Pros</h3>
<ul>
<li>[Positive aspect 1]</li>
<li>[Positive aspect 2]</li>
</ul>

<h3>Cons</h3>
<ul>
<li>[Negative aspect 1]</li>
<li>[Negative aspect 2]</li>
</ul>

<h2>Who Should Use This</h2>
<p>[Target audience and use cases]</p>

<h2>Final Thoughts</h2>
<p>[Conclusion and recommendation]</p>`
    },
    {
        id: 'opinion',
        name: 'Opinion Piece',
        description: 'Share your perspective on a topic or trend',
        category: 'Opinion',
        icon: '💭',
        content: `<h2>Introduction</h2>
<p>[Hook or opening statement about the topic]</p>

<h2>The Current Situation</h2>
<p>[Background context on the issue or trend]</p>

<h2>My Perspective</h2>
<p>[Your main argument or viewpoint]</p>

<h3>Why This Matters</h3>
<p>[Explanation of significance]</p>

<h2>Supporting Arguments</h2>

<h3>Point 1: [Argument]</h3>
<p>[Detailed explanation with examples or evidence]</p>

<h3>Point 2: [Argument]</h3>
<p>[Detailed explanation with examples or evidence]</p>

<h3>Point 3: [Argument]</h3>
<p>[Detailed explanation with examples or evidence]</p>

<h2>Counter-Arguments</h2>
<p>[Acknowledge opposing views and respond to them]</p>

<h2>Conclusion</h2>
<p>[Summarize your position and call to action or reflection]</p>`
    },
    {
        id: 'listicle',
        name: 'List Article',
        description: 'Numbered or bulleted list of tips, resources, or items',
        category: 'List',
        icon: '📝',
        content: `<h2>Introduction</h2>
<p>Here are [number] [things] that will help you [benefit or goal].</p>

<h2>1. [First Item]</h2>
<p>[Detailed explanation of this item]</p>
<p><strong>Why it matters:</strong> [Benefit or reason]</p>

<h2>2. [Second Item]</h2>
<p>[Detailed explanation of this item]</p>
<p><strong>Why it matters:</strong> [Benefit or reason]</p>

<h2>3. [Third Item]</h2>
<p>[Detailed explanation of this item]</p>
<p><strong>Why it matters:</strong> [Benefit or reason]</p>

<h2>4. [Fourth Item]</h2>
<p>[Detailed explanation of this item]</p>
<p><strong>Why it matters:</strong> [Benefit or reason]</p>

<h2>5. [Fifth Item]</h2>
<p>[Detailed explanation of this item]</p>
<p><strong>Why it matters:</strong> [Benefit or reason]</p>

<h2>Bonus: [Extra Item]</h2>
<p>[Additional valuable item or tip]</p>

<h2>Wrapping Up</h2>
<p>[Summary and encouragement to apply these items]</p>`
    },
    {
        id: 'comparison',
        name: 'Comparison Article',
        description: 'Compare and contrast two or more options',
        category: 'Comparison',
        icon: '⚖️',
        content: `<h2>Introduction</h2>
<p>Choosing between [Option A] and [Option B] can be challenging. This comparison will help you decide.</p>

<h2>At a Glance</h2>
<table>
<thead>
<tr>
<th>Feature</th>
<th>[Option A]</th>
<th>[Option B]</th>
</tr>
</thead>
<tbody>
<tr>
<td>Price</td>
<td>[Price A]</td>
<td>[Price B]</td>
</tr>
<tr>
<td>[Feature 1]</td>
<td>[Value A]</td>
<td>[Value B]</td>
</tr>
</tbody>
</table>

<h2>[Option A]</h2>
<p>[Detailed description]</p>

<h3>Strengths</h3>
<ul>
<li>[Strength 1]</li>
<li>[Strength 2]</li>
</ul>

<h3>Weaknesses</h3>
<ul>
<li>[Weakness 1]</li>
<li>[Weakness 2]</li>
</ul>

<h2>[Option B]</h2>
<p>[Detailed description]</p>

<h3>Strengths</h3>
<ul>
<li>[Strength 1]</li>
<li>[Strength 2]</li>
</ul>

<h3>Weaknesses</h3>
<ul>
<li>[Weakness 1]</li>
<li>[Weakness 2]</li>
</ul>

<h2>Which Should You Choose?</h2>
<p><strong>Choose [Option A] if:</strong> [Scenarios]</p>
<p><strong>Choose [Option B] if:</strong> [Scenarios]</p>

<h2>Final Verdict</h2>
<p>[Your recommendation based on different use cases]</p>`
    },
    {
        id: 'beginner-guide',
        name: 'Beginner\'s Guide',
        description: 'Comprehensive introduction for newcomers',
        category: 'Guide',
        icon: '🎯',
        content: `<h2>Welcome!</h2>
<p>New to [topic]? This beginner's guide will help you get started with confidence.</p>

<h2>What is [Topic]?</h2>
<p>[Simple explanation of the topic]</p>

<h2>Why Should You Learn This?</h2>
<ul>
<li>[Benefit 1]</li>
<li>[Benefit 2]</li>
<li>[Benefit 3]</li>
</ul>

<h2>Essential Concepts</h2>

<h3>Concept 1: [Name]</h3>
<p>[Beginner-friendly explanation]</p>

<h3>Concept 2: [Name]</h3>
<p>[Beginner-friendly explanation]</p>

<h3>Concept 3: [Name]</h3>
<p>[Beginner-friendly explanation]</p>

<h2>Getting Started</h2>
<p>[Step-by-step guide for absolute beginners]</p>

<h2>Common Mistakes to Avoid</h2>
<ol>
<li>[Mistake 1] - [How to avoid it]</li>
<li>[Mistake 2] - [How to avoid it]</li>
</ol>

<h2>Resources for Learning More</h2>
<ul>
<li>[Resource 1]</li>
<li>[Resource 2]</li>
<li>[Resource 3]</li>
</ul>

<h2>Next Steps</h2>
<p>[Where to go from here]</p>`
    }
];

// Helper function to get template by ID
export const getTemplateById = (id: string): ArticleTemplate | undefined => {
    return articleTemplates.find(template => template.id === id);
};

// Helper function to get templates by category
export const getTemplatesByCategory = (category: string): ArticleTemplate[] => {
    return articleTemplates.filter(template => template.category === category);
};

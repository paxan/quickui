from node import Node # fixme to absolute import
from template import Template

__all__ = ['HtmlNode']

class HtmlNode(Node):
    def __init__(self, **kwargs):
        super(HtmlNode, self).__init__()
        self.id = kwargs.get('id')
        self._html = kwargs.get('html')
        self._children = kwargs.get('children')
        if self._children is not None:
            pass # make node collection!

    @property
    def html(self): return self._html

    @html.setter
    def html(self, value): self._html = value

    @property
    def children(self): return self._children

    @children.setter
    def children(self, value): self._children = value

    def emit_javascript(self, indent_level=0):
        """
        Return the JavaScript for the given HTML node.
        """
        html = self.escape_javascript(self.html)
        if self.id is None and self.children is None:
            # Simplest case; just quote the HTML and return it.
            return Template.format('{html}', html=self.html)
        else:
            return Template.format(
                '{variable_declaration}$({html}){children}[0]',
                variable_declaration=self.emit_variable_declaration(),
                html=self.html,
                children=self.emit_children(indent_level)
            )

    def emit_children(self, indent_level):
        return '' if self.children is None else Template.format(
            '.items(\n{children}{tabs})',
            children=self.children.emit_items(indent_level + 1),
            tabs='\t' * indent_level
        )

#         [TestFixture]
#         public class Tests
#         {
#             [Test]
#             public void Text()
#             {
#                 HtmlNode node = new HtmlNode("Hello");
#                 Assert.AreEqual("\"Hello\"", node.EmitJavaScript());
#             }
# 
#             [TestCase("<div>Hi</div>", Result = "\"<div>Hi</div>\"")]
#             [TestCase("<div><h1/><p>Hello</p></div>", Result = "\"<div><h1/><p>Hello</p></div>\"")]
#             public string Html(string source)
#             {
#                 HtmlNode node = new HtmlNode(source);
#                 return node.EmitJavaScript();
#             }
# 
#             [Test]
#             public void HtmlWithId()
#             {
#                 HtmlNode node = new HtmlNode("<div id=\"foo\">Hi</div>", "foo");
#                 Assert.AreEqual("this.foo = $(\"<div id=\\\"foo\\\">Hi</div>\")[0]", node.EmitJavaScript());
#             }
# 
#             [Test]
#             public void HtmlContainsHtmlWithId()
#             {
#                 // <div><h1/><p id="content">Hello</p></div>
#                 HtmlNode node = new HtmlNode("<div />")
#                 {
#                     ChildNodes = new NodeCollection(new Node[] {
#                         new HtmlNode("<h1 />"),
#                         new HtmlNode("<p id=\"content\">Hello</p>", "content")
#                     })
#                 };
#                 Assert.AreEqual(
#                     "$(\"<div />\").items(\n" +
#                     "\t\"<h1 />\",\n" +
#                     "\tthis.content = $(\"<p id=\\\"content\\\">Hello</p>\")[0]\n" +
#                     ")[0]",
#                     node.EmitJavaScript());
#             }
#         }
#     }
# }

from quickui.compiler.node import Node
from quickui.compiler.nodecollection import NodeCollection
from quickui.compiler.template import Template

__all__ = ['HtmlNode']

class HtmlNode(Node):
    def __init__(self, **kwargs):
        super(HtmlNode, self).__init__()
        self.id = kwargs.get('id')
        self._html = kwargs.get('html')
        self._children = kwargs.get('children')
        if self._children is not None:
            self._children = NodeCollection(self._children)

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
        esc_html = self.escape_javascript(self.html)
        if self.id is None and self.children is None:
            # Simplest case; just quote the HTML and return it.
            return Template.format('{html}', html=esc_html)
        else:
            return Template.format(
                '{variable_declaration}$({html}){children}[0]',
                variable_declaration=self.emit_variable_declaration(),
                html=esc_html,
                children=self.emit_children(indent_level)
            )

    def emit_children(self, indent_level):
        return '' if self.children is None else Template.format(
            '.items(\n{children}{tabs})',
            children=self.children.emit_items(indent_level + 1),
            tabs=self.tabs(indent_level)
        )

import unittest
class HtmlNodeTests(unittest.TestCase):
    def test_text(self):
        node = HtmlNode(html='Hello')
        self.assertEquals('"Hello"', node.emit_javascript())

    def test_markup(self):
        def with_html(h):
            return HtmlNode(html=h).emit_javascript()
        self.assertEquals(
            '"<div>Hi</div>"', with_html('<div>Hi</div>'))
        self.assertEquals(
            '"<div><h1/><p>Hello</p></div>"', with_html('<div><h1/><p>Hello</p></div>'))

    def test_html_with_id(self):
        node = HtmlNode(html='<div id="foo">Hi</div>', id='foo')
        self.assertEquals(
            'this.foo = $("<div id=\\"foo\\">Hi</div>")[0]',
            node.emit_javascript())

    def test_html_contains_html_with_id(self):
        node = HtmlNode(
            html='<div />',
            children=(
                HtmlNode(html='<h1 />'),
                HtmlNode(html='<p id="content">Hello</p>', id='content')))
        self.assertEquals("""\
$("<div />").items(
\t"<h1 />",
\tthis.content = $("<p id=\\"content\\">Hello</p>")[0]
)[0]""", node.emit_javascript())

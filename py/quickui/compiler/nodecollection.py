from quickui.compiler.node import Node
from quickui.compiler.template import Template

__all__ = ['NodeCollection']

class NodeCollection(Node):
    def __init__(self, items):
        self._items = tuple(items)

    @property
    def items(self): return self._items

    @items.setter
    def items(self, value): self._items = value

    def __iter__(self):
        for item in self.items:
            yield item

    def emit_javascript(self, indent_level=0):
        """
        Return the JavaScript for the collection as an array.
        """
        return Template.format(
            '[\n{items}{tabs}]',
            items=self.emit_items(indent_level + 1),
            tabs=self.tabs(indent_level)
        )

    def emit_items(self, indent_level):
        result = ',\n'.join(self.emit_node_in_collection(node, indent_level)
                            for node in self.items)
        return result + '\n' if result else result

    def emit_node_in_collection(self, node, indent_level):
        """
        Return the JavaScript to generate a single node.
        """
        return Template.format(
            '{tabs}{node}',
            tabs=self.tabs(indent_level),
            node=node.emit_javascript(indent_level)
        )

import unittest

class NodeCollectionTests(unittest.TestCase):
    def test_collection(self):
        from quickui.compiler.htmlnode import HtmlNode
        nodes = NodeCollection((
            HtmlNode(html='Hi, '),
            HtmlNode(id='content', html='<span id="content"/>')
        ))
        self.assertEquals("""\
[
\t"Hi, ",
\tthis.content = $("<span id=\\"content\\"/>")[0]
]""", nodes.emit_javascript())

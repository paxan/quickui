from quickui.compiler.template import Template
from quickui.compiler.htmlelements import HtmlElements
from quickui.compiler.node import Node
from quickui.compiler.htmlnode import HtmlNode
from quickui.compiler.nodecollection import NodeCollection

class CompilerException(Exception):
    """
    >>> try:
    ...     raise CompilerException('Very bad thing happened during compilation!')
    ... except Exception, ex:
    ...     ex.args
    ('Very bad thing happened during compilation!',)
    """

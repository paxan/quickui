from quickui.compiler.template import Template
from quickui.compiler.htmlelements import HtmlElements

class CompilerException(Exception):
    """
    >>> try:
    ...     raise CompilerException('Very bad thing happened during compilation!')
    ... except Exception, ex:
    ...     ex.args
    ('Very bad thing happened during compilation!',)
    """
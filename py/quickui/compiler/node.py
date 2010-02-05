# -*- coding: utf-8 -*-

from abc import *

__all__ = ['Node']

class Node:
    __metaclass__ = ABCMeta

    def __init__(self):
        self._id = None

    # UNDONE: Push 'id' property down into HtmlNode and ControlNode
    @property
    def id(self): return self._id

    @id.setter
    def id(self, value): self._id = value

    @abstractmethod
    def emit_javascript(self, indent_level=0):
        """
        Return the JavaScript for this node, indenting at the given number of tabs.
        """

    def emit_variable_declaration(self):
        """
        If the node defines an ID, return the JavaScript for the
        left-hand side of a variable declaration on the control class
        that will use that ID. If there is no ID, return ''.
        """
        return 'this.{0} = '.format(self.id) if self.id else ''

    tab_string = '\t'

    @classmethod
    def tabs(cls, tab_count):
        return cls.tab_string * tab_count

    def indent_line(self, s, tab_count):
        chunks = []
        chunks.append(self.tabs(tab_count))
        chunks.append(s)
        chunks.append('\n')
        return ''.join(chunks) # UNDONE: see if 'yield' is more pythonic?

    _control_chars = dict((eval('"\\{0}"'.format(c)), '\\' + c) for c in 'btnfr')

    @classmethod
    def escape_javascript(cls, s):
        """
        Return an escaped version of the string that will be acceptable to JavaScript.
        Adapted from "Enquote" found at json.org by Are Bjolseth.
        """
        chunks = []
        chunks.append('"')
        for c in s:
            if c in ('\\', '"'):
                chunks.append('\\' + c)
            else:
                chunks.append(cls._control_chars.get(
                    c,
                    '\\u{0:04x}'.format(ord(c)) if c < ' ' else c
                ))
        chunks.append('"')
        return ''.join(chunks) # UNDONE: see if 'yield' is more pythonic?

import unittest

class _NodeTests(unittest.TestCase):
    def test_escape_javascript(self):
        self.assertEquals(
            u'"Hey \\b\\t\\n\\f\\r You \\u001f 捌"',
            Node.escape_javascript(u"Hey \b\t\n\f\r You \x1F 捌"))

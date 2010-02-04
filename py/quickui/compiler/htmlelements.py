"""
>>> 'div' in HtmlElements
True
>>> 'table' in HtmlElements
True
>>> 'foo' in HtmlElements
False
"""

import os.path
import contextlib

from quickui import coroutine, CoSax

__all__ = ['HtmlElements']

# UNDONE: utilities?
@contextlib.contextmanager
def resource_reader(name):
    with open(os.path.join(os.path.dirname(__file__), name), 'rb') as resource_stream:
        yield resource_stream

# UNDONE: utilities?
@coroutine
def load_elements(element_set):
    while True:
        event, value = (yield)
        if event == 'start' and value[0] == 'ArrayOfString':
            while True:
                event, value = (yield)
                if event == 'end' and value == 'ArrayOfString':
                    break
                elif event == 'start' and value[0] == 'string':
                    chunks = []
                    while True:
                        event, value = (yield)
                        if event == 'end' and value == 'string':
                            element_set.add(''.join(chunks))
                            break
                        elif event == 'text':
                            chunks.append(str(value))

class _HtmlElements(object):
    def __init__(self):
        self._element_set = set()
        with resource_reader('HtmlElements.xml') as res:
            CoSax.parse(res, load_elements(self._element_set))
        self._element_set = frozenset(self._element_set)

    def __contains__(self, maybe_element):
        try:
            name = str(maybe_element.name)
        except AttributeError:
            name = maybe_element
        return maybe_element in self._element_set

    @property
    def elements(self):
        return self._element_set

HtmlElements = _HtmlElements()

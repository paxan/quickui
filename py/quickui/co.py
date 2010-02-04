"""
Coroutine support.

This magic is by David Beazley:
http://www.dabeaz.com/coroutines/

He is also the author of:
"Python Essential Reference, 4th Edition"
http://www.amazon.com/Python-Essential-Reference-Developers-Library/dp/0672329786
"""

import functools
from xml.sax import ContentHandler, parse

__all__ = ['coroutine', 'CoSax']

def coroutine(func):
    """
    A decorator function that takes care of starting a coroutine
    automatically on call.

    >>> @coroutine
    ... def pong():
    ...   while True:
    ...     message = (yield)
    ...     if message == 'ping':
    ...       print('pong!')

    >>> ponger = pong()
    >>> ponger.send('1')
    >>> ponger.send('2')
    >>> ponger.send('3')
    >>> ponger.send('ping')
    pong!
    """
    @functools.wraps(func)
    def start(*args, **kwargs):
        cr = func(*args, **kwargs)
        cr.next()
        return cr
    return start

class CoSax(ContentHandler):
    """
    Coroutine-based XML parser.
    It sends SAX events to a coroutine target.

    See: the unit test below that demonstrates this way of parsing XML.
    """
    def __init__(self, target):
        self.target = target

    def startElement(self, name, attrs):
        self.target.send(('start', (name, attrs._attrs)))

    def characters(self, text):
        self.target.send(('text', text))

    def endElement(self, name):
        self.target.send(('end', name))

    @classmethod
    def parse(cls, filename_or_stream, target):
        parse(filename_or_stream, cls(target))

import unittest

class CoSaxTests(unittest.TestCase):
    def test_example(self):
        import cStringIO as sio
        events = []

        @coroutine
        def f():
            fragments = []
            while True:
                events.append((yield))

        buf = sio.StringIO("<root a='1' b='2' c='3'><child1 /><child2>Oliver</child2>foo bar</root>")
        CoSax.parse(buf, f())

        self.assertEquals([
            ('start', ('root', {'a': '1', 'b': '2', 'c': '3'})),
            ('start', ('child1', {})),
            ('end', 'child1'),
            ('start', ('child2', {})),
            ('text', 'Oliver'),
            ('end', 'child2'),
            ('text', 'foo bar'),
            ('end', 'root')], events)

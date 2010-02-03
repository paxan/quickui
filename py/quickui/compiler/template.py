"""
Template support.
"""

import re

__all__ = ['Template']

class Template(object):
    _arg = re.compile(r'\{([^{]+?)\}')

    @classmethod
    def format(cls, template_source, ns=None, **kwargs):
        """
        Given a `ns` object with name-value pairs, return
        the result of performing string replacments in the given template
        where all {name} occurrences are replaced with the corresponding value.

        For instance:
        >>> Template.format('{Foo}, {Bar}! I am {Name} from flight {No}.', dict(
        ...    Bar='world',
        ...    Foo='Hello'), Name='John Locke', No=815)
        'Hello, world! I am John Locke from flight 815.'
        """
        # TODO: args that don't have matching values in the namespace
        #   are left unexpanded. Is this desired behaviour?
        ns = {} if ns is None else dict(ns)
        ns.update(**kwargs)

        def expand_args():
            i = 0
            for mo in cls._arg.finditer(template_source):
                yield template_source[i:mo.start()]
                yield '%s' % ns.get(mo.group(1), mo.group())
                i = mo.end()
            yield template_source[i:]

        return ''.join(expand_args())

import unittest

class TemplateTests(unittest.TestCase):
    def test_unexpanded(self):
        self.assertEquals('{foo}',
            Template.format('{foo}'))
    def test_kwargs(self):
        self.assertEquals('you & me',
            Template.format('{foo} & {bar}', foo='you', bar='me'))
    def test_ns(self):
        self.assertEquals('you & me',
            Template.format('{foo} & {bar}', dict(foo='you', bar='me')))
    def test_ns_and_kwargs(self):
        self.assertEquals('you & me & 300', Template.format('{foo} & {bar} & {n}',
            dict(foo='you', bar='me'), n='300'))
    def test_non_string_value(self):
        self.assertEquals('42.0',
            Template.format('{answer}', answer=42.0))

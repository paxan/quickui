"""
Template support.
"""

class Template(object):
    @classmethod
    def format(cls, template_source, namespace):
        """
        Given a `namespace` object with name-value pairs, return
        the result of performing string replacments in the given template
        where all {name} occurrences are replaced with the corresponding value.

        For instance:
        >>> Template.format('{Foo}, {Bar}!', dict(
        ...    Bar='world',
        ...    Foo='Hello'))
        'Hello, world!'
        """
        # TODO: SYNTAX SUGAR: support namespace values that are namedtuples.
        return template_source.format(**namespace)

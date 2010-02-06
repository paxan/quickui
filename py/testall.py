from quickui import co
from quickui import compiler

compiler_modules = (
    'template htmlelements node '
    'nodecollection htmlnode control '
).strip().split()

exec 'from quickui.compiler import {0}'.format(
    ', '.join(compiler_modules))

def run_tests(*modules, **kwargs):
    """
    Runs all unit and doc tests present in the specified modules, and exits
    with the appropriate exit code.
    """
    import unittest
    import doctest
    import sys

    verbosity = kwargs.get('verbosity', 0)
    success = True
    for module in modules:
        suite = unittest.TestLoader().loadTestsFromModule(module)
        if doctest.DocTestFinder().find(module):
            suite.addTest(doctest.DocTestSuite(module))
        result = unittest.TextTestRunner(verbosity=verbosity).run(suite)
        success = success and result.wasSuccessful()
    sys.exit(0 if success else 1)

run_tests(co, compiler, 
          *(eval(m) for m in compiler_modules))

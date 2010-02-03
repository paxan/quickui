import quickui.compiler.template

def run_tests(module, verbosity=2, skip_doctests=False):
    """
    Runs all unit and doc tests present in the executing module, and exits
    with the appropriate exit code.
    """
    import unittest
    import doctest
    import sys
    suite = unittest.TestLoader().loadTestsFromModule(module)
    if doctest.DocTestFinder().find(module):
        if not skip_doctests:
            suite.addTest(doctest.DocTestSuite(module))
    else:
        raise ValueError("Module has no docstrings, which is a bad thing!")
    result = unittest.TextTestRunner(verbosity=verbosity).run(suite)
    sys.exit(not result.wasSuccessful())

run_tests(quickui.compiler.template)

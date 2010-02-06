__all__ = ['Control']

class Control(object):
    """
    An instance of a Quick control.

    UNDONE: Should probably derive this from Node directly and remove ControlNode
    """
    def __init__(self):
        self._class_name = {}
        self._properties = {}

    def __getitem__(self, key):
        return self.properties[key]

    def __setitem__(self, key, value):
        self.properties[key] = value

    for name in ('class_name', 'properties'):
        exec 'def _get_{0}(self): return self._{0}'.format(name)
        exec 'def _set_{0}(self, v): self._{0} = v'.format(name)
        exec '{0} = property(_get_{0}, _set_{0})'.format(name)
    del name

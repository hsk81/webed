__author__ = 'hsk81'

###############################################################################
###############################################################################

class Linq:

    def __init__ (self, iterable):

        self.iterable = iterable

    def first (self):

        assert len (self.iterable) > 0
        return self.iterable[0]

    def first_or_default (self, default=None):

        if len (self.iterable) > 0:
            return self.iterable[0]
        else:
            return default

    def last (self):

        assert len (self.iterable) > 0
        return self.iterable[-1]

    def last_or_default (self, default=None):

        if len (self.iterable) > 0:
            return self.iterable[-1]
        else:
            return default

    def filter (self, fn):

        return Linq (filter (fn, self.iterable))

    def select (self, fn):

        pass ## TODO: Implement projection!

###############################################################################
###############################################################################

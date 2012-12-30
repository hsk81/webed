__author__ = 'hsk81'

###############################################################################
###############################################################################

from sqlalchemy.ext.hybrid import hybrid_property
from uuid import uuid4 as uuid_random

from ..ext.db import db
from ..ext.cache import cache

###############################################################################
###############################################################################

class Node (db.Model):
    __mapper_args__ = {'polymorphic_identity':'node', 'polymorphic_on':'type'}

    id = db.Column (db.Integer, db.Sequence ('node_id_seq'), primary_key=True)
    type = db.Column ('type', db.String (16), nullable=False, index=True)

    ###########################################################################

    root_id = db.Column (db.Integer, db.ForeignKey (id, ondelete='CASCADE'),
        index=True)
    base_id = db.Column (db.Integer, db.ForeignKey (id, ondelete='CASCADE'),
        index=True)

    nodes = db.relationship ('Node',
        cascade='all, delete-orphan', lazy='dynamic',
        primaryjoin='Node.id==Node.root_id',
        backref=db.backref ('root', remote_side=id))

    subnodes = db.relationship ('Node',
        cascade='all, delete-orphan', lazy='dynamic',
        primaryjoin='Node.id==Node.base_id',
        backref=db.backref ('base', remote_side=id))

    ###########################################################################

    _uuid = db.Column (db.String (36), nullable=False, index=True, unique=True,
        name = 'uuid')
    _mime = db.Column (db.String (256), nullable=False, index=True,
        name = 'mime')
    _name = db.Column (db.Unicode (256), nullable=False, index=True,
        name = 'name')

    @hybrid_property
    def uuid (self):
        return self._uuid

    @hybrid_property
    def mime (self):
        return self._mime

    @mime.setter
    def mime (self, value):
        self._mime = value

    @hybrid_property
    def name (self):
        return self._name

    @name.setter
    def name (self, value):

        if self._name != value:
            key = cache.make_key (self.uuid, 'rev', 'name')
            rev = cache.get (key) or 0; cache.set (key, rev+1)
            self._name = value

    ###########################################################################

    def __init__ (self, name, root, mime=None, uuid=None):

        self.base = root.base if root and root.base else root
        self.root = root

        self._uuid = uuid if uuid else str (uuid_random ())
        self._name = unicode (name) if name is not None else None
        self._mime = mime if mime else 'application/node'

    def __repr__ (self):

        return u'<Node@%x: %s>' % (self.id, self.name)

    ###########################################################################

    def get_path (self, field): ## TODO: 'rev'-decorator?

        if self.root:
            rev_key = cache.make_key (self.root.uuid, 'rev', field)
            rev = cache.get (rev_key) or 0
            val_key = cache.make_key (self.root.uuid, field, rev)
            val = cache.get (val_key)

            if not val:
                val = self.root.get_path (field)
                cache.set (rev_key, rev)
                cache.set (val_key, val)

            return val + [eval ('self.' + field)]
        else:
            return [eval ('self.' + field)]

###############################################################################
###############################################################################

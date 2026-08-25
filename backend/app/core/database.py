from typing import Dict, Any, List, Optional

class InMemoryStore:
    def __init__(self):
        self._data: Dict[str, Dict[str, Any]] = {}

    def set(self, collection: str, key: str, value: Any) -> None:
        if collection not in self._data:
            self._data[collection] = {}
        self._data[collection][key] = value

    def get(self, collection: str, key: str) -> Optional[Any]:
        return self._data.get(collection, {}).get(key)

    def get_all(self, collection: str) -> List[Any]:
        return list(self._data.get(collection, {}).values())

    def search(self, collection: str, query_func) -> List[Any]:
        collection_data = self._data.get(collection, {})
        return [v for v in collection_data.values() if query_func(v)]

_store = InMemoryStore()

def get_store() -> InMemoryStore:
    return _store

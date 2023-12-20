class Group{
    constructor(name, id, items) {
        this.name = name;
        this.id = id;
        this.items = items.map(item => new Item(item.name, item.description, item.synonyms));
    }
}
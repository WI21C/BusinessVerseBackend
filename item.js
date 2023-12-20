class Item {
    constructor(name, description, synonyms) {
        this.name = name;
        this.description = description;
        this.synonyms = synonyms.map(syn => new Synonym(syn.name, syn.softwares, syn.args));
    }
}
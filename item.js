class Item {
    constructor(id, name, description, synonyms) {
        this.id = id; //id da name bei mehreren items gleich seien kann
        this.name = name;
        this.description = description;
        this.synonyms = synonyms.map(syn => new Synonym(syn.name, syn.softwares, syn.args));
    }
}
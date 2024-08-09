export class Project {
    public id: number
    public name: string;
    public description: string;
    public users: number;
    public rating: number;
    public access: string;
    public lastScanned: Date;

    constructor(id: number, name: string, description: string, users: number, rating: number, access: string, lastScanned: Date) {
        this.id = id
        this.name = name
        this.description = description
        this.users = users
        this.rating = rating
        this.access = access
        this.lastScanned = lastScanned
    }
}
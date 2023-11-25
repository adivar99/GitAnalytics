export class User {
    public username: string;
    public email: string;
    public name: string;
    public is_active: boolean;
    public user_type: string;
    public is_admin: boolean
    public company_id: number

    constructor(username: string, email: string, name: string, is_active: boolean, is_admin: boolean, user_type: string, company_id: number) {
        this.username = username;
        this.email = email;
        this.name = name;
        this.is_active = is_active;
        this.is_admin = is_admin;
        this.user_type = user_type;
        this.company_id = company_id
    }
}
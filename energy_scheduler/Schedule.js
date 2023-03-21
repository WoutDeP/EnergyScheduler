export class Schedule {
    constructor(
        id,
        start,
        end,
        name,
        wattage
    ) {
        this.id = id;
        this.start = start;
        this.end = end;
        this.name = name;
        this.wattage = wattage;
    }
}
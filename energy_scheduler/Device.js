export class Device {
    constructor(
        id,
        friendly_name,
        state,
        consumption,
        startTime,
        endTime,
        duration,
        obligatory,
        importance,
        splittable
    ) {
        this.id = id;
        this.friendly_name = friendly_name;
        this.state = state;
        this.consumption = consumption;
        this.startTime = startTime;
        this.endTime = endTime;
        this.duration = duration;
        this.obligatory = obligatory;
        this.importance = importance;
        this.splittable = splittable;
    }
}
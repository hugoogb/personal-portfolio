import type { RoutePlan } from "@/world/traffic/model";

export interface Packet {
  plan: number;
  s: number;
  speed: number;
}
export interface Pulse {
  x: number;
  z: number;
  life: number;
  down: boolean;
}

/**
 * The packets on the roads: requests leave a door at each route's rate,
 * arrive at the yard, and are answered (unless the service is down) by a
 * response on the opposite lane.
 */
export class TrafficSim {
  reqs: Packet[] = [];
  ress: Packet[] = [];
  pulses: Pulse[] = [];
  onSpawn?: (p: Packet) => void;
  onPulse?: (p: Pulse) => void;
  private acc: number[];

  constructor(
    private plans: RoutePlan[],
    private caps: { req: number; res: number },
    private rand: () => number = Math.random,
  ) {
    this.acc = plans.map(() => rand());
  }

  setPlans(plans: RoutePlan[]) {
    if (plans.length !== this.plans.length) {
      this.acc = plans.map(() => this.rand());
      this.reqs = [];
      this.ress = [];
    }
    this.plans = plans;
  }

  setCaps(caps: { req: number; res: number }) {
    this.caps = caps;
    this.reqs.length = Math.min(this.reqs.length, caps.req);
    this.ress.length = Math.min(this.ress.length, caps.res);
  }

  private pulse(x: number, z: number, down: boolean) {
    const p = { x, z, life: 1, down };
    this.pulses.push(p);
    this.onPulse?.(p);
  }

  step(dt: number) {
    for (let i = 0; i < this.plans.length; i++) {
      const plan = this.plans[i];
      this.acc[i] += dt * plan.rate;
      while (this.acc[i] >= 1) {
        this.acc[i] -= 1;
        if (this.reqs.length >= this.caps.req) continue;
        const p: Packet = { plan: i, s: 0, speed: plan.speed };
        this.reqs.push(p);
        this.onSpawn?.(p);
        const [x, z] = plan.route.path[0];
        this.pulse(x, z, false);
      }
    }

    // In-place compaction: keep survivors in order, no new arrays.
    let w = 0;
    for (let r = 0; r < this.reqs.length; r++) {
      const p = this.reqs[r];
      p.s += dt * p.speed;
      const plan = this.plans[p.plan];
      const end = plan.route.path.length - 1;
      if (p.s < end) {
        this.reqs[w++] = p;
        continue;
      }
      const [x, z] = plan.route.path[end];
      this.pulse(x, z, plan.down);
      if (!plan.down && this.ress.length < this.caps.res) {
        this.ress.push({ plan: p.plan, s: 0, speed: plan.speed });
      }
    }
    this.reqs.length = w;

    w = 0;
    for (let r = 0; r < this.ress.length; r++) {
      const p = this.ress[r];
      p.s += dt * p.speed;
      if (p.s < this.plans[p.plan].route.path.length - 1) this.ress[w++] = p;
    }
    this.ress.length = w;

    w = 0;
    for (let r = 0; r < this.pulses.length; r++) {
      const p = this.pulses[r];
      if ((p.life -= dt * 1.5) > 0) this.pulses[w++] = p;
    }
    this.pulses.length = w;
  }
}

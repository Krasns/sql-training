import { Database } from "../src/database";
import { MOVIES, MOVIE_ACTORS } from "../src/table-names";
import { minutes } from "./utils";

describe("Simple Queries", () => {
  let db: Database;

  beforeAll(async () => {
    db = await Database.fromExisting("05", "06");
  }, minutes(3));

  it(
    "should select total budget and revenue from movies, by using adjusted financial data",
    async done => {
      const query = `select round(sum(budget_adjusted),2) as total_budget, round(sum(revenue_adjusted),2) as total_revenue from ${MOVIES}`;
      const result = await db.selectSingleRow(query);

      expect(result).toEqual({
        total_budget: 53668223285.94,
        total_revenue: 148342748033.4
      });

      done();
    },
    minutes(3)
  );

  it(
    "should select count from movies where budget was more than 100000000 and release date after 2009",
    async done => {
      const query = `select count(*) as count from movies where budget>100000000 and release_date >'01-01-2009'`;
      const result = await db.selectSingleRow(query);

      expect(result.count).toBe(116);

      done();
    },
    minutes(3)
  );

  it(
    "should select top three movies order by budget where release data is after 2009",
    async done => {
      const query = `select original_title,budget,revenue from movies where release_date >'01-01-2009' ORDER BY budget DESC LIMIT 3`;
      const result = await db.selectMultipleRows(query);

      expect(result).toEqual([
        {
          original_title: "The Warrior's Way",
          budget: 425000000.0,
          revenue: 11087569.0
        },
        {
          original_title: "Avengers: Age of Ultron",
          budget: 280000000,
          revenue: 1405035767
        },
        {
          original_title: "Tangled",
          budget: 260000000,
          revenue: 591794936
        }
      ]);

      done();
    },
    minutes(3)
  );

  it(
    "should select count of movies where homepage is secure (starts with https)",
    async done => {
      const query = `select count(*) as count from movies where homepage like 'https%'`;
      const result = await db.selectSingleRow(query);

      expect(result.count).toBe(42);

      done();
    },
    minutes(3)
  );

  it(
    "should select count of movies released every year",
    async done => {
      const query = `select count(*) as count,substr(release_date,0,5) as year from movies GROUP BY year ORDER BY year DESC LIMIT 8`;
      const result = await db.selectMultipleRows(query);

      expect(result.length).toBe(8);
      expect(result.slice(0, 3)).toEqual([
        {
          count: 627,
          year: "2015"
        },
        {
          count: 696,
          year: "2014"
        },
        {
          count: 487,
          year: "2010"
        }
      ]);

      done();
    },
    minutes(3)
  );

  it(
    "should select top three users which left most ratings",
    async done => {
      const query = `select user_id, count(*) as count from MOVIE_RATINGS GROUP BY user_id order by count DESC LIMIT 3`;
      const result = await db.selectMultipleRows(query);

      expect(result).toEqual([
        {
          user_id: 8659,
          count: 48
        },
        {
          user_id: 45811,
          count: 45
        },
        {
          user_id: 179792,
          count: 40
        }
      ]);

      done();
    },
    minutes(3)
  );

  it(
    "should select count of ratings left each month",
    async done => {
      const query = `select count(*) as count,substr(time_created, 6, 2) as month FROM  MOVIE_RATINGS GROUP BY month ORDER BY count DESC`;
      const result = await db.selectMultipleRows(query);

      expect(result).toEqual([
        {
          count: 16521,
          month: "11"
        },
        {
          count: 16479,
          month: "12"
        },
        {
          count: 15175,
          month: "10"
        },
        {
          count: 14619,
          month: "01"
        },
        {
          count: 14557,
          month: "07"
        },
        {
          count: 14080,
          month: "03"
        },
        {
          count: 13655,
          month: "06"
        },
        {
          count: 13071,
          month: "05"
        },
        {
          count: 12812,
          month: "08"
        },
        {
          count: 12623,
          month: "04"
        },
        {
          count: 11765,
          month: "02"
        },
        {
          count: 10502,
          month: "09"
        }
      ]);

      done();
    },
    minutes(3)
  );
});

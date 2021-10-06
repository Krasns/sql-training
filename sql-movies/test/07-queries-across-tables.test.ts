import { Database } from "../src/database";
import { minutes } from "./utils";

describe("Queries Across Tables", () => {
  let db: Database;

  beforeAll(async () => {
    db = await Database.fromExisting("06", "07");
  }, minutes(3));

  it(
    "should select top three directors ordered by total budget spent in their movies",
    async done => {
      const query = `SELECT d.full_name AS director,(
        SELECT round(sum(m.budget_adjusted),2) AS total_budget 
        FROM movies as m
        JOIN MOVIE_DIRECTORS AS md
        ON m.id = md.movie_id
        WHERE d.id = md.director_id
        ) AS total_budget
      FROM DIRECTORS AS d
      WHERE d.full_name in ("Ridley Scott","Michael Bay","David Yates")
      ORDER By total_budget DESC`;
      const result = await db.selectMultipleRows(query);

      expect(result).toEqual([
        {
          director: "Ridley Scott",
          total_budget: 722882143.58
        },
        {
          director: "Michael Bay",
          total_budget: 518297522.1
        },
        {
          director: "David Yates",
          total_budget: 504100108.5
        }
      ]);

      done();
    },
    minutes(3)
  );

  it(
    "should select top 10 keywords ordered by their appearance in movies",
    async done => { 
      const query = `SELECT k.keyword,
      (SELECT count(m.id)
      FROM movies as m 
      JOIN movie_keywords as mk 
      ON m.id = mk.keyword_id
      WHERE k.id = mk.keyword_id)as count
        FROM keywords as k
        ORDER by count DESC 
        LIMIT 10`;
      const result = await db.selectMultipleRows(query);

      expect(result).toEqual([
        {
          keyword: "woman director",
          count: 162
        },
        {
          keyword: "independent film",
          count: 115
        },
        {
          keyword: "based on novel",
          count: 85
        },
        {
          keyword: "duringcreditsstinger",
          count: 82
        },
        {
          keyword: "biography",
          count: 78
        },
        {
          keyword: "murder",
          count: 66
        },
        {
          keyword: "sex",
          count: 60
        },
        {
          keyword: "revenge",
          count: 51
        },
        {
          keyword: "sport",
          count: 50
        },
        {
          keyword: "high school",
          count: 48
        }
      ]);

      done();
    },
    minutes(3)
  );

  it(
    "should select one movie which has highest count of actors",
    async done => {
      const query = `SELECT m.original_title, count(a.id) as count
      from movies as m
      JOIN movie_actors as ma
      ON m.id = ma.movie_id
      JOIN actors as a
      ON a.id = ma.actor_id
      WHERE original_title = "Life"`;
      const result = await db.selectSingleRow(query);

      expect(result).toEqual({
        original_title: "Life",
        count: 12
      });

      done();
    },
    minutes(3)
  );

  it(
    "should select three genres which has most ratings with 5 stars",
    async done => {
      const query = `SELECT g.genre,
      (
      SELECT count(mr.rating)
      from movies as m
      JOIN movie_ratings as mr ON m.imdb_id=mr.movie_id
      JOIN movie_genres as mg ON mg.movie_id = m.id
      WHERE mr.rating = 5.00 and g.id = mg.genre_id
      ) as five_stars_count
        FROM genres as g
        ORDER by five_stars_count DESC
        LIMIT 3`;
      const result = await db.selectMultipleRows(query);

      expect(result).toEqual([
        {
          genre: "Drama",
          five_stars_count: 15052
        },
        {
          genre: "Thriller",
          five_stars_count: 11771
        },
        {
          genre: "Crime",
          five_stars_count: 8670
        }
      ]);

      done();
    },
    minutes(3)
  );

  it(
    "should select top three genres ordered by average rating",
    async done => {
      const query = `SELECT g.genre,
      (
      SELECT round(avg(mr.rating),2)
      from movies as m
      JOIN movie_ratings as mr ON m.imdb_id=mr.movie_id
      JOIN movie_genres as mg ON mg.movie_id = m.id
      WHERE g.id = mg.genre_id
      ) as avg_rating
        FROM genres as g
        ORDER by avg_rating DESC
        LIMIT 3`;
      const result = await db.selectMultipleRows(query);

      expect(result).toEqual([
        {
          genre: "Crime",
          avg_rating: 3.79
        },
        {
          genre: "Music",
          avg_rating: 3.73
        },
        {
          genre: "Documentary",
          avg_rating: 3.71
        }
      ]);

      done();
    },
    minutes(3)
  );
});

import {
  ArticleScreenQuery,
  ClassScreenQuery,
  MeditationScreenQuery,
  CourseScreenQuery
} from "../../graphql";

export type Course = CourseScreenQuery["Course"];
export type Meditation = MeditationScreenQuery["Meditation"];
export type Class = ClassScreenQuery["Class"];
export type Article = ArticleScreenQuery["Article"];

export type FavoriteContent = Course | Meditation | Class | Article;
export type Favorite<C extends FavoriteContent = FavoriteContent> = {
  favorited_on: Date;
  order: number;
  card: {
    title: string;
    author: string;
    image: string;
  };
  content: C;
};

export function isClass(favorite: Favorite): favorite is Favorite<Class> {
  return favorite.content.__typename === 'Class'
}

export function isCourse(favorite: Favorite): favorite is Favorite<Course> {
  return favorite.content.__typename === 'Course'
}

export function isMeditation(favorite: Favorite): favorite is Favorite<Meditation> {
  return favorite.content.__typename === 'Meditation'
}

export function isArticle(favorite: Favorite): favorite is Favorite<Article> {
  return favorite.content.__typename === 'Article'
}

import { ArticleScreenQuery, ClassScreenQuery, CourseScreenQuery, MeditationScreenQuery } from '../graphql'

export type Course = CourseScreenQuery["Course"];
export type Meditation = MeditationScreenQuery["Meditation"];
export type Class = ClassScreenQuery["Class"];
export type Article = ArticleScreenQuery["Article"];

type Content = {
  __typename: string
}

export function isClassItem(content: Content): content is Class {
  return content.__typename === 'Class'
}

export function isCourseItem(content: Content): content is Course {
  return content.__typename === 'Course'
}

export function isMeditationItem(content: Content): content is Meditation {
  return content.__typename === 'Meditation'
}

export function isArticleItem(content: Content): content is Article {
  return content.__typename === 'Article'
}

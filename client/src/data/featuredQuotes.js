export const FEATURED_QUOTES = [
  { text: "The soul becomes dyed with the color of its thoughts.", source: "Marcus Aurelius", textKo: "영혼은 자신의 생각의 빛깔로 물든다.", sourceKo: "마르쿠스 아우렐리우스" },
  { text: "Not all those who wander are lost.", source: "J.R.R. Tolkien", textKo: "방랑한다고 해서 모두 길을 잃은 것은 아니다.", sourceKo: "J.R.R. 톨킨" },
  { text: "We accept the love we think we deserve.", source: "Stephen Chbosky", textKo: "우리는 자신이 받을 자격이 있다고 생각하는 사랑을 받아들인다.", sourceKo: "스티븐 크보스키" },
  { text: "Time you enjoy wasting is not wasted time.", source: "Marthe Troly-Curtin", textKo: "즐겁게 낭비한 시간은 낭비된 시간이 아니다.", sourceKo: "마르트 트롤리-커틴" },
  { text: "Simplicity is the ultimate sophistication.", source: "Leonardo da Vinci", textKo: "단순함이야말로 궁극의 정교함이다.", sourceKo: "레오나르도 다 빈치" },
  { text: "The unexamined life is not worth living.", source: "Socrates", textKo: "성찰하지 않는 삶은 살 가치가 없다.", sourceKo: "소크라테스" },
  { text: "To live is the rarest thing in the world. Most people just exist.", source: "Oscar Wilde", textKo: "진정으로 사는 것은 세상에서 가장 드문 일이다. 대부분의 사람들은 그저 존재할 뿐이다.", sourceKo: "오스카 와일드" },
  { text: "In the middle of difficulty lies opportunity.", source: "Albert Einstein", textKo: "어려움 속에 기회가 있다.", sourceKo: "알베르트 아인슈타인" },
  { text: "It is not length of life, but depth of life.", source: "Ralph Waldo Emerson", textKo: "중요한 것은 삶의 길이가 아니라 깊이다.", sourceKo: "랠프 왈도 에머슨" },
  { text: "A reader lives a thousand lives before he dies.", source: "George R.R. Martin", textKo: "독자는 죽기 전에 천 개의 삶을 산다.", sourceKo: "조지 R.R. 마틴" },
  { text: "The present moment always will have been.", source: "Ursula K. Le Guin", textKo: "현재 순간은 언제나 존재했던 것이 될 것이다.", sourceKo: "어슐러 K. 르 귄" },
  { text: "Do I dare disturb the universe?", source: "T.S. Eliot", textKo: "내가 감히 우주를 뒤흔들 수 있을까?", sourceKo: "T.S. 엘리엇" },
  { text: "I am not afraid of storms, for I am learning how to sail my ship.", source: "Louisa May Alcott", textKo: "나는 폭풍이 두렵지 않다. 내 배를 항해하는 법을 배우고 있으니까.", sourceKo: "루이자 메이 올컷" },
  { text: "The cave you fear to enter holds the treasure you seek.", source: "Joseph Campbell", textKo: "당신이 들어가기를 두려워하는 동굴에 당신이 찾는 보물이 있다.", sourceKo: "조지프 캠벨" },
];

function todaySeed() {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

export function getDailyQuote() {
  return FEATURED_QUOTES[todaySeed() % FEATURED_QUOTES.length];
}

export function getRecommendedQuote() {
  return FEATURED_QUOTES[Math.floor(Math.random() * FEATURED_QUOTES.length)];
}

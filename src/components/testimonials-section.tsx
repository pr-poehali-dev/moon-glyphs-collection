import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const testimonials = [
  {
    name: "Мария К.",
    role: "Слушатель, Москва",
    avatar: "/professional-woman-scientist.png",
    content:
      "Это что-то совершенно новое — стихи, которые звучат. Музыка не просто фон, она буквально продолжает слова. Слушаю снова и снова.",
  },
  {
    name: "Дмитрий Л.",
    role: "Музыкальный блогер",
    avatar: "/cybersecurity-expert-man.jpg",
    content:
      "Редко встречаешь проект, где авторский голос и ИИ работают так органично. Это не электронщина ради электронщины — здесь есть душа.",
  },
  {
    name: "Алина В.",
    role: "Поклонница проекта",
    avatar: "/asian-woman-tech-developer.jpg",
    content:
      "Каждый трек — как маленький фильм в голове. Стихи такие образные, а музыка усиливает каждое слово. Очень жду новых релизов.",
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-24 px-6 bg-card">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-card-foreground mb-4 font-sans">Что говорят слушатели</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Живые отзывы людей, которых тронули стихи и музыка
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="glow-border slide-up" style={{ animationDelay: `${index * 0.15}s` }}>
              <CardContent className="p-6">
                <p className="text-card-foreground mb-6 leading-relaxed italic">"{testimonial.content}"</p>
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={testimonial.avatar || "/placeholder.svg"} alt={testimonial.name} />
                    <AvatarFallback>
                      {testimonial.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-primary">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
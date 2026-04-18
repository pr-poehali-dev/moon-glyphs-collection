import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function FAQSection() {
  const faqs = [
    {
      question: "Кто создаёт стихи?",
      answer:
        "Стихи пишет живой автор — человек с собственным опытом, голосом и взглядом на мир. ИИ не пишет тексты, он создаёт музыку под уже готовые стихи.",
    },
    {
      question: "Как ИИ создаёт музыку?",
      answer:
        "Нейросеть анализирует ритм, настроение и образы стихотворения, после чего генерирует оригинальную мелодию. Каждый трек создаётся специально для конкретного текста и больше нигде не используется.",
    },
    {
      question: "Где можно послушать треки?",
      answer:
        "Произведения публикуются на стриминговых платформах. Ссылки на актуальные релизы доступны на этом сайте. Следите за обновлениями!",
    },
    {
      question: "Это жанр музыки или поэзии?",
      answer:
        "Это нечто новое — на стыке. Не речитатив и не аудиокнига. Стихи живут в музыке и вместе с ней создают единое художественное пространство.",
    },
    {
      question: "Как часто выходят новые произведения?",
      answer:
        "Автор работает в свободном творческом режиме. Новые треки выходят регулярно — подпишитесь, чтобы не пропустить релизы.",
    },
    {
      question: "Можно ли использовать музыку и стихи?",
      answer:
        "Все произведения защищены авторским правом. Личное прослушивание — всегда пожалуйста. По вопросам коммерческого использования или коллаборации пишите напрямую.",
    },
  ]

  return (
    <section className="py-24 bg-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-orbitron">Частые вопросы</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto font-space-mono">
            Всё, что вы хотели знать о проекте, о стихах и о том, как рождается музыка.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-red-500/20 mb-4">
                <AccordionTrigger className="text-left text-lg font-semibold text-white hover:text-red-400 font-orbitron px-6 py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-300 leading-relaxed px-6 pb-4 font-space-mono">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
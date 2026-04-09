import { Card } from '../../components/index'

export function FaqPanel() {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <h2>Will drinks be provided?</h2>
        <p>Please enjoy a drink on us! A hosted bar will be available until our tab is reached, after which it will become a cash bar. We recommend bringing a card or cash just in case.We appreciate your understanding and can't wait to celebrate with you!</p>
      </Card>

      <Card>
        <h2>What is the dress code?</h2>
        <p>We kindly ask our guests to dress in their Sunday's best attire with a semi-formal style. While the event is indoors, we would recommend wearing light and breathable fabrics. Kindly avoid jeans, overly-casual wear, and athletic attire.</p>
        <p>For women, sundresses, midi or maxi dresses, or dressy jumpsuits are great options. For men, collared shirts or button down shirts with slacks or dress pants are appropriate. Light-weight suits or blazers are welcome but not required.</p>
      </Card>
    </div>
  )
}
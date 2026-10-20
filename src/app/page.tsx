import Button from "@/app/ui/Button";

export default function Home() {
  return (
    <div className="flex justify-center items-center">
      <div className="w-96 rounded-md overflow-hidden">
        <div>0</div>
        <div className="grid grid-cols-4">
          <>
            <Button variant="func">AC</Button>
            <Button variant="func">+/-</Button>
            <Button variant="func">%</Button>
            <Button variant="operator">÷</Button>
          </>
          <>
            <Button>7</Button>
            <Button>8</Button>
            <Button>9</Button>
            <Button variant="operator">×</Button>
          </>
          <>
            <Button>4</Button>
            <Button>5</Button>
            <Button>6</Button>
            <Button variant="operator">-</Button>
          </>
          <>
            <Button>1</Button>
            <Button>2</Button>
            <Button>3</Button>
            <Button variant="operator">+</Button>
          </>
          <>
            <Button className="col-start-1 col-end-3">0</Button>
            <Button>.</Button>
            <Button variant="operator">=</Button>
          </>
        </div>
      </div>
    </div>
  );
}

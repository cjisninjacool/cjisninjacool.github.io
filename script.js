function myFunction(p1, p2) {
  return p1 * p2;
}

function myFunction(){
  num = document.getElementById("Num1").value;
  two = document.getElementById("Num2").value;

  document.getElementById("demo").innerHTML = num*two;
}

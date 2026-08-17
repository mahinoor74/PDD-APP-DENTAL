import java.util.*;
public class Main{
    public static void main(String[] args){
        Scanner sc=new Scanner(System.in);
        int n=sc.nextInt();
        int temp=num;
        int rev=0;
        while(num!=0){
            int digit=num%10;
           rev+=digit;
           num=num/10;
           if(temp==rev){
            System.out.println("PALINDROME");
           }
           ELSE{
            System.out.println("Not Plaindrome");
           }
            
        }
    }
}